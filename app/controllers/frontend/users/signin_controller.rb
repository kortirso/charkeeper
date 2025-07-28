# frozen_string_literal: true

module Frontend
  module Users
    class SigninController < Frontend::BaseController
      include Signable

      skip_before_action :authenticate
      before_action :find_user
      before_action :authenticate_user

      def create
        user_session = User::Session.create!(user: @user)
        @user.platforms.find_or_create_by!(name: params[:platform]) if params[:platform]
        auth_response(user_session)
      end

      private

      def find_user
        @user = User.find_by(username: user_params[:username])
        return if @user.present?

        unprocessable_response({ base: [t('dry_schema.errors.user.invalid')] })
      end

      def authenticate_user
        return if @user.authenticate(user_params[:password])

        unprocessable_response({ base: [t('dry_schema.errors.user.invalid')] })
      end

      def user_params
        params.expect(user: %i[username password])
      end
    end
  end
end
