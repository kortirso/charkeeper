# frozen_string_literal: true

module Web
  module Users
    class SigninController < Web::BaseController
      include AuthkeeperDeps[fetch_session: 'services.fetch_session']

      skip_before_action :authenticate, only: %i[new create]
      before_action :find_user, only: %i[create]
      before_action :authenticate_user, only: %i[create]

      def new
        @user = User.new
      end

      def create
        sign_in(@user)
        redirect_to dashboard_path
      end

      def destroy
        destroy_session
        cookies.delete(Authkeeper.configuration.access_token_name)
        redirect_to root_path
      end

      private

      def destroy_session
        auth_call = fetch_session.call(token: cookies[Authkeeper.configuration.access_token_name])
        return if auth_call[:errors].present?

        auth_call[:result].destroy
      end

      def find_user
        @user = User.find_by(username: user_params[:username])
        return if @user.present?

        failed_sign_in
      end

      def authenticate_user
        return if @user.authenticate(user_params[:password])

        failed_sign_in
      end

      def failed_sign_in
        redirect_to new_signin_path, alert: { errors: t('dry_schema.errors.user.invalid') }
      end

      def user_params
        params.expect(user: %i[username password])
      end
    end
  end
end
