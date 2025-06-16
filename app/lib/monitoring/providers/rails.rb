# frozen_string_literal: true

module Monitoring
  module Providers
    class Rails
      def notify(exception:, metadata: {}, severity: nil)
        ::Rails.error.report(exception, context: metadata, severity: severity)
      end
    end
  end
end
