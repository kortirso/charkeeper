# frozen_string_literal: true

describe NotificationsContext::SendService do
  subject(:service_call) { described_class.new.call(notification: notification) }

  let!(:notification) { create :notification, locale: 'ru', targets: %w[telegram] }
  let!(:identity1) { create :user_identity, provider: 'telegram', active: true }
  let!(:identity2) { create :user_identity, provider: 'telegram', active: true }
  let(:telegram_api) { Charkeeper::Container.resolve('api.telegram.client') }

  before do
    identity1.user.update!(locale: 'ru')
    identity2.user.update!(locale: 'en')

    create :user_identity, provider: 'telegram', active: false
    create :user_identity, provider: 'google', active: true

    allow(telegram_api).to receive(:send_message)
  end

  it 'sends notification only for required identities' do
    service_call

    expect(telegram_api).to have_received(:send_message).once.with(
      bot_secret: nil, chat_id: identity1.uid, text: notification.value
    )
  end
end
