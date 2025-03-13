# frozen_string_literal: true

describe Webhooks::TelegramsController do
  describe 'POST#create' do
    before do
      allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify)
    end

    context 'when message present in payload', :aggregate_failures do
      it 'calls monitoring' do
        post :create, params: {
          message: { from: { first_name: 'First', last_name: 'Last' }, chat: { id: 'id' }, text: 'text' }
        }

        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
        expect(response).to have_http_status :ok
      end
    end
  end
end
