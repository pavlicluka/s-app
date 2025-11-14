import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    // Fetch MISP feed manifest with proper error handling
    const manifestResponse = await fetch(
      "https://www.cert.si/misp/feed/manifest.json",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Standario-MISP-Client/1.0",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    )

    if (!manifestResponse.ok) {
      console.error(
        `MISP feed error: HTTP ${manifestResponse.status} ${manifestResponse.statusText}`
      )
      return new Response(
        JSON.stringify({
          success: false,
          error: `HTTP ${manifestResponse.status}: ${manifestResponse.statusText}`,
          demo: true,
        }),
        {
          status: 200, // Return 200 to trigger demo fallback on frontend
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    const manifestData = await manifestResponse.json()

    // Fetch up to 20 events from the manifest
    const eventIds = Object.keys(manifestData).slice(0, 20)
    const eventPromises = eventIds.map(async (eventId) => {
      try {
        const eventResponse = await fetch(
          `https://www.cert.si/misp/feed/${eventId}.json`,
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "User-Agent": "Standario-MISP-Client/1.0",
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout per event
          }
        )

        if (!eventResponse.ok) {
          return null
        }

        const eventData = await eventResponse.json()
        return {
          id: eventData.Event?.id || eventId,
          uuid: eventData.Event?.uuid || eventId,
          date: eventData.Event?.date || new Date().toISOString().split("T")[0],
          info: eventData.Event?.info || "Ni na voljo",
          threat_level_id: eventData.Event?.threat_level_id || "4",
          published: eventData.Event?.published || false,
          timestamp: eventData.Event?.timestamp || Math.floor(Date.now() / 1000).toString(),
          attribute_count: eventData.Event?.attribute_count || "0",
          analysis: eventData.Event?.analysis || "0",
          orgc: eventData.Event?.Orgc,
          org: eventData.Event?.Org,
        }
      } catch (error) {
        console.warn(`Failed to fetch event ${eventId}:`, error)
        return null
      }
    })

    const events = await Promise.all(eventPromises)
    const validEvents = events.filter((event) => event !== null)

    return new Response(
      JSON.stringify({
        success: true,
        events: validEvents,
        count: validEvents.length,
        demo: false,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error: any) {
    console.error("MISP feed fetch error:", error)

    // Return error response that will trigger demo fallback
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to fetch MISP feed",
        demo: true,
      }),
      {
        status: 200, // Return 200 so frontend knows to handle demo
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
})
