# frozen_string_literal: true

describe Frontend::AuthController do
  describe 'POST#create' do
    let(:request) { post :create, params: { check_string: check_string, hash: hash } }
    # rubocop: disable Layout/LineLength
    let(:check_string) { "auth_date=1662771648\nquery_id=AAHdF6IQAAAAAN0XohDhrOrc\nuser={\"id\":279058397,\"first_name\":\"Vladislav\",\"last_name\":\"Kibenko\",\"username\":\"vdkfrost\",\"language_code\":\"ru\",\"is_premium\":true}" }
    # rubocop: enable Layout/LineLength
    let(:hash) { 'c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2' }

    before do
      allow(Charkeeper::Container.resolve('services.auth_context.validate_web_telegram_signature')).to(
        receive(:valid?).and_return(web_telegram_signature_valid)
      )
      allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify)
    end

    context 'for invalid params' do
      let(:web_telegram_signature_valid) { false }

      it 'returns errors', :aggregate_failures do
        expect { request }.not_to change(User::Identity, :count)
        expect(response).to have_http_status :unprocessable_content
        expect(response.parsed_body['errors']).to eq({ 'signature' => ['Invalid'] })
        expect(Charkeeper::Container.resolve('monitoring.client')).not_to have_received(:notify)
      end
    end

    context 'for valid params' do
      let(:web_telegram_signature_valid) { true }

      it 'returns access token', :aggregate_failures do
        expect { request }.to change(User::Identity, :count).by(1)
        expect(response).to have_http_status :created
        expect(response.parsed_body['access_token']).not_to be_nil
        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
      end
    end
  end
end
