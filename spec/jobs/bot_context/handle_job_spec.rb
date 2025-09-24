# frozen_string_literal: true

describe BotContext::HandleJob do
  subject(:job_call) { described_class.perform_now(params: params) }

  let(:params) do
    {
      message: {
        message_id: 1,
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: 123 },
        text: '/text'
      }
    }
  end
  let(:handler) { Charkeeper::Container.resolve('services.bot_context.handle') }

  before { allow(handler).to receive(:call) }

  it 'calls service' do
    job_call

    expect(handler).to have_received(:call)
  end
end
