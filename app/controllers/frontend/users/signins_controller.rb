# frozen_string_literal: true

module Frontend
  module Users
    class SigninsController < Frontend::BaseController
      include AuthkeeperDeps[
        fetch_session: 'services.fetch_session',
        fetch_uuid: 'services.fetch_uuid'
      ]
      include Signable

      skip_before_action :authenticate, only: %i[create]
      before_action :find_user, only: %i[create]
      before_action :authenticate_user, only: %i[create]

      def create
        user_session = User::Session.create!(user: @user)
        @user.platforms.find_or_create_by!(name: params[:platform]) if params[:platform]
        auth_response(user_session)
      end

      def destroy
        destroy_session
        only_head_response
      end

      private

      def find_user
        @user = User.find_by(username: user_params[:username])
        return if @user.present?

        unprocessable_response([t('dry_schema.errors.user.invalid')], [t('dry_schema.errors.user.invalid')])
      end

      def authenticate_user
        return if @user.authenticate(user_params[:password])

        unprocessable_response([t('dry_schema.errors.user.invalid')], [t('dry_schema.errors.user.invalid')])
      end

      def destroy_session
        auth_call = fetch_session.call(token: bearer_token || params[Authkeeper.configuration.access_token_name])
        return if auth_call[:errors].present?

        auth_call[:result].destroy

        auth_uuid = fetch_uuid.call(token: bearer_token || params[Authkeeper.configuration.access_token_name])
        Rails.cache.delete("authkeeper_cached_user_v2/#{auth_uuid[:result]}") if auth_uuid[:result]
      end

      def user_params
        params.expect(user: %i[username password])
      end

      def bearer_token
        pattern = /^Bearer /
        header = request.headers['Authorization']
        header.gsub(pattern, '') if header&.match(pattern)
      end
    end
  end
end
