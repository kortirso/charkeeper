# frozen_string_literal: true

module Monitoring
  module Providers
    class Bugsnag
      def notify(exception:, metadata: {}, severity: nil)
        ::Bugsnag.notify(exception) do |event|
          # Adjust the severity of this notification
          event.severity = severity if severity

          # Add customer information to this event
          event.add_metadata(:metadata, metadata)
        end
      end
    end
  end
end
