# frozen_string_literal: true

module Monitoring
  module Providers
    class Rails
      def notify(exception:, metadata: {}, severity: nil)
        exception.set_backtrace([])
        ::Rails.error.report(exception, context: metadata, severity: severity)
      end
    end
  end
end
