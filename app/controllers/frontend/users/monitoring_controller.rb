# frozen_string_literal: true

module Frontend
  module Users
    class MonitoringController < Frontend::BaseController
      include Deps[monitoring: 'monitoring.client']

      def create
        monitoring.notify(
          exception: Monitoring::FrontendError.new('Receive frontend error'),
          metadata: { payload: params[:payload], user_id: current_user.id },
          severity: :info
        )
        head :ok
      end
    end
  end
end
