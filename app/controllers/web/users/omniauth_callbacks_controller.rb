# frozen_string_literal: true

module Web
  module Users
    class OmniauthCallbacksController < Authkeeper::OmniauthCallbacksController
      include Deps[
        add_identity: 'commands.auth_context.add_identity'
      ]

      DISABLED_RUSSIAN_PROVIDERS = %w[google discord telegram].freeze

      def create
        user = current_user.nil? ? auth_login : auth_attach(current_user)
        if user
          sign_in(user) if current_user.nil?
          I18n.locale = user.locale.to_sym if user.locale
          redirect_to after_sign_in_path, notice: { auth: t('web.users.auth.notice') }
        else
          redirect_to root_path, alert: { auth: t('web.users.auth.alert') }
        end
      end

      private

      def auth_login # rubocop: disable Metrics/AbcSize
        identity = User::Identity.find_by(uid: parsed_auth[:uid], provider: parsed_auth[:provider])
        if identity.present?
          if disabled_russian_provider?
            return if identity.user.russian_login? # если юзер логинится второй раз после запрета

            identity.user.update(russian_login: true) # отметить, что логинится первый раз после запрета
          end

          return identity.user
        end

        return if disabled_russian_provider? # запретить создание аккаунта

        identity = add_identity.call(parsed_auth.merge(username: parsed_auth[:login] || parsed_auth[:email]).compact)[:result]
        identity.user
      end

      def disabled_russian_provider?
        Rails.env.ru_production? && DISABLED_RUSSIAN_PROVIDERS.include?(parsed_auth[:provider].to_s)
      end

      def auth_attach(user)
        identity = User::Identity.find_by(uid: parsed_auth[:uid], provider: parsed_auth[:provider])
        if identity.nil?
          identity =
            add_identity.call(
              parsed_auth.merge(user: user, username: parsed_auth[:login] || parsed_auth[:email]).compact
            )[:result]
        end
        identity.update(user: user) if identity&.user != user
        user
      end

      def after_sign_in_path
        fall_back_url = session[:charkeeper_fall_back_url]
        session[:charkeeper_fall_back_url] = nil

        return fall_back_url if fall_back_url

        dashboard_path
      end

      def parsed_auth
        @parsed_auth ||= auth.key?(:user_info) ? auth[:user_info] : auth
      end
    end
  end
end
