# frozen_string_literal: true

describe Frontend::Dc20::AncestriesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    let(:request) { get :index, params: { charkeeper_access_token: access_token } }

    context 'for logged users' do
      context 'without feats' do
        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['ancestries'].size).to eq 0
        end
      end

      context 'with feats' do
        let!(:feat) { create :feat, :rally, type: 'Dc20::Feat', origin: 0, origin_value: 'elf', info: { price: 1 } }

        it 'returns data', :aggregate_failures do
          request

          response_values = response.parsed_body.dig('ancestries', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['ancestries'].size).to eq 1
          expect(response_values['id']).to eq feat.id
        end
      end
    end
  end
end
