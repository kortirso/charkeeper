# frozen_string_literal: true

describe AuthContext::WebTelegramSignatureValidateService do
  subject(:service_call) { instance.valid?(check_string: check_string, hash: hash) }

  let!(:instance) { described_class.new(bot_token: bot_token) }
  # https://docs.telegram-mini-apps.com/platform/init-data#validating
  let(:bot_token) { '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8' }
  # rubocop: disable Layout/LineLength
  let(:check_string) { "auth_date=1662771648\nquery_id=AAHdF6IQAAAAAN0XohDhrOrc\nuser={\"id\":279058397,\"first_name\":\"Vladislav\",\"last_name\":\"Kibenko\",\"username\":\"vdkfrost\",\"language_code\":\"ru\",\"is_premium\":true}" }
  # rubocop: enable Layout/LineLength
  let(:hash) { 'c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2' }

  context 'for invalid params' do
    let(:hash) { 'invalid' }

    it 'returns false' do
      expect(service_call).to be_falsy
    end
  end

  context 'for valid params' do
    it 'returns true' do
      expect(service_call).to be_truthy
    end
  end
end
