# frozen_string_literal: true

describe Webhooks::DiscordsController do
  describe 'POST#create' do
    # rubocop: disable Layout/LineLength
    let(:signature) do
      '7ccf3edb9ee3e2f061f2bdf02f1bfdbdec538f2fd8dcb4108aa26d65b5da01068e2fdfd8dd716341fbaa96bc740ed934e7a98e3f98d7e15270cb744b93fa3505'
    end
    # rubocop: enable Layout/LineLength

    before do
      allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify)

      request.headers['X-Signature-Ed25519'] = signature
      request.headers['X-Signature-Timestamp'] = '1760352406'
    end

    it 'calls handler', :aggregate_failures do
      # rubocop: disable Style/StringLiterals
      post :create, body: "{\"version\":1,\"application_id\":\"1408454100642955296\",\"type\":0}"
      # rubocop: enable Style/StringLiterals

      expect(response).to have_http_status :no_content
      expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
    end

    context 'with invalid signature' do
      it 'calls handler', :aggregate_failures do
        post :create, params: {}

        expect(response).to have_http_status :unauthorized
        expect(Charkeeper::Container.resolve('monitoring.client')).not_to have_received(:notify)
      end
    end
  end
end
