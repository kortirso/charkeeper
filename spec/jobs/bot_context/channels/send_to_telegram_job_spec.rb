# frozen_string_literal: true

describe BotContext::Channels::SendToTelegramJob do
  subject(:job_call) { described_class.perform_now(chat_id, text) }

  let(:chat_id) { 1234 }
  let(:text) { 'text' }
  let(:handler) { Charkeeper::Container.resolve('api.telegram.client') }

  before { allow(handler).to receive(:send_message) }

  it 'calls service' do
    job_call

    expect(handler).to have_received(:send_message)
  end
end
