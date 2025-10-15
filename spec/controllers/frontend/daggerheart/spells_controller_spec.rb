# frozen_string_literal: true

describe Frontend::Daggerheart::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :feat, :rally, origin: 7, origin_value: 'bone', conditions: { level: 1 }
        create :feat, :rally, origin: 7, origin_value: 'arcana', conditions: { level: 2 }
        create :feat, :rally, origin: 7, origin_value: 'midnight', conditions: { level: 3 }
      end

      it 'returns data', :aggregate_failures do
        get :index, params: { charkeeper_access_token: access_token, format: :json }

        response_values = response.parsed_body.dig('spells', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['spells'].size).to eq 3
        expect(response_values.keys).to contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions')
      end

      context 'with filtering' do
        it 'returns data', :aggregate_failures do
          get :index, params: { charkeeper_access_token: access_token, domains: 'bone,arcana', format: :json }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 2
          expect(response.parsed_body['spells'].pluck('origin_value').sort).to eq(%w[arcana bone])
          expect(response_values.keys).to contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions')
        end
      end

      context 'with filtering by level' do
        it 'returns data', :aggregate_failures do
          get :index, params: {
            charkeeper_access_token: access_token, domains: 'bone,arcana,midnight', max_level: 1, format: :json
          }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
          expect(response.parsed_body['spells'].pluck('origin_value').sort).to eq(%w[bone])
          expect(response_values.keys).to contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions')
        end
      end
    end
  end
end
