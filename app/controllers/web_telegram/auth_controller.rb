# frozen_string_literal: true

module WebTelegram
  class AuthController < WebTelegram::BaseController
    include AuthkeeperDeps[generate_token: 'services.generate_token']
    include Deps[
      add_identity: 'commands.auth_context.add_identity',
      web_telegram_signature: 'services.auth_context.validate_web_telegram_signature'
    ]

    skip_before_action :authenticate

    def create
      if web_telegram_signature.valid?(check_string: params[:check_string], hash: params[:hash])
        access_token = generate_token.call(user_session: user_session)[:result]
        render json: { access_token: access_token }, status: :created
      else
        render json: { errors: { signature: ['Invalid'] } }, status: :unprocessable_entity
      end
    end

    private

    def user_session
      ActiveRecord::Base.transaction do
        identity = find_identity || create_identity
        User::Session.create!(user: identity.user)
      end
    end

    def find_identity
      User::Identity.find_by(provider: User::Identity::TELEGRAM, uid: user_data['id'].to_s)
    end

    def create_identity
      add_identity.call({
        provider: User::Identity::TELEGRAM,
        uid: user_data['id'].to_s,
        username: user_data['username']
      })[:result]
    end

    def user_data
      @user_data ||= JSON.parse(params[:check_string].split("\n").to_h { |item| item.split('=') }['user'])
    end
  end
end
