# frozen_string_literal: true

describe Webhooks::DiscordsController do
  describe 'POST#create' do
    before { allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify) }

    it 'calls handler', :aggregate_failures do
      post :create

      expect(response).to have_http_status :no_content
      expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
    end
  end
end
