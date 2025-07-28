# frozen_string_literal: true

module Frontend
  module Users
    class SignupController < Frontend::BaseController
      include Deps[
        monitoring: 'monitoring.client',
        add_user: 'commands.auth_context.add_user'
      ]
      include Signable

      skip_before_action :authenticate
      before_action :monitoring_signup, only: %i[create]

      def create
        case add_user.call(create_params)
        in { errors: errors } then unprocessable_response(errors)
        in { result: result }
          user_session = User::Session.create!(user: result)
          result.platforms.find_or_create_by!(name: params[:platform]) if params[:platform]
          auth_response(user_session)
        end
      end

      private

      def monitoring_signup
        monitoring.notify(
          exception: Monitoring::AuthByUsername.new('Signup attempt with username'),
          severity: :info
        )
      end

      def create_params
        params.require(:user).permit!.to_h
      end
    end
  end
end
