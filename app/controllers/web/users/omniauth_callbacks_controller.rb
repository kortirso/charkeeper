# frozen_string_literal: true

module Web
  module Users
    class OmniauthCallbacksController < Authkeeper::OmniauthCallbacksController
      include Deps[
        add_identity: 'commands.auth_context.add_identity'
      ]

      def create
        user = auth_login(auth, current_user)
        if user
          sign_in(user) if current_user.nil?
          I18n.locale = user.locale.to_sym if user.locale
          redirect_to after_sign_in_path, notice: { auth: t('web.users.auth.notice') }
        else
          redirect_to root_path, alert: { auth: t('web.users.auth.alert') }
        end
      end

      private

      def auth_login(auth, user=nil)
        identity = User::Identity.find_by(uid: auth[:uid], provider: auth[:provider])
        return identity.user if identity.present?

        identity = add_identity.call(auth.merge(user: user, username: auth[:login] || auth[:email]).compact)[:result]
        identity.user
      end

      def after_sign_in_path
        fall_back_url = session[:charkeeper_fall_back_url]
        session[:charkeeper_fall_back_url] = nil

        return fall_back_url if fall_back_url

        dashboard_path
      end
    end
  end
end
