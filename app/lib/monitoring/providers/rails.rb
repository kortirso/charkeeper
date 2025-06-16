# frozen_string_literal: true

module Monitoring
  module Providers
    class Rails
      def notify(exception:, metadata: {}, severity: nil)
        ::Rails.error.handle(context: metadata, severity: severity) { raise exception }
      end
    end
  end
end
