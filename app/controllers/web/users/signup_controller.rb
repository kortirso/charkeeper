# frozen_string_literal: true

module Web
  module Users
    class SignupController < Web::BaseController
      include Deps[
        add_user: 'commands.auth_context.add_user'
      ]

      skip_before_action :authenticate
      before_action :honeypot_check, only: %i[create]

      def new
        @user = User.new
      end

      def create
        case add_user.call(create_params)
        in { errors: errors } then redirect_to new_signup_path, alert: errors
        in { result: result }
          sign_in(result)
          redirect_to dashboard_path
        end
      end

      private

      def honeypot_check
        return if params[:user][:bonus].blank?

        redirect_to new_signup_path, alert: { spam: t('web.users.auth.spam') }
      end

      def create_params
        params.require(:user).permit!.to_h
      end
    end
  end
end
