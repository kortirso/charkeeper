# frozen_string_literal: true

module NotificationsContext
  class SendService
    include Deps[telegram_api: 'api.telegram.client']

    def call(notification:)
      notification.targets.each do |target|
        User::Identity
          .active.where(provider: target)
          .joins(:user).where(users: { locale: notification.locale })
          .find_each do |identity|
            send_notification(notification, identity)
          end
      end
    end

    private

    def send_notification(notification, identity)
      case identity.provider
      when User::Identity::TELEGRAM
        response = telegram_api.send_message(bot_secret: bot_secret, chat_id: identity.uid, text: notification.value)
        identity.update!(active: false) if response.nil?
      end
    end

    def bot_secret
      Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
    end
  end
end
