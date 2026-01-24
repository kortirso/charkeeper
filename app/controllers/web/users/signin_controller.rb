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
        sign_out
        redirect_to root_path
      end

      private

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
