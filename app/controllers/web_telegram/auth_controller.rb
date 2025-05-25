# frozen_string_literal: true

module WebTelegram
  class AuthController < WebTelegram::BaseController
    include AuthkeeperDeps[generate_token: 'services.generate_token']
    include Deps[
      monitoring: 'monitoring.client',
      add_identity: 'commands.auth_context.add_identity',
      web_telegram_signature: 'services.auth_context.validate_web_telegram_signature'
    ]

    skip_before_action :authenticate

    def create
      # if true
      if web_telegram_signature.valid?(check_string: params[:check_string], hash: params[:hash])
        user_session = start_user_session
        monitoring_telegram_auth(user_session.user)
        access_token = generate_token.call(user_session: user_session)[:result]
        render json: { access_token: access_token, locale: user_session.user.locale }, status: :created
      else
        render json: { errors: { signature: ['Invalid'] } }, status: :unprocessable_entity
      end
    end

    private

    def start_user_session
      # return User::Session.last
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
        username: user_data['username'],
        locale: locale.to_s
      })[:result]
    end

    def user_data
      @user_data ||= JSON.parse(params[:check_string].split("\n").to_h { |item| item.split('=') }['user'])
    end

    def locale
      user_locale = user_data['language_code'].to_sym
      I18n.available_locales.include?(user_locale) ? user_locale : I18n.default_locale
    end

    def monitoring_telegram_auth(user)
      monitoring.notify(
        exception: Monitoring::AuthByTelegram.new('Auth attempt with Telegram'),
        metadata: { check_string: params[:check_string], user_id: user.id },
        severity: :info
      )
    end
  end
end
