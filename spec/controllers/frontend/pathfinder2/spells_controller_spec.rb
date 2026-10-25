# frozen_string_literal: true

describe Frontend::Pathfinder2::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :pathfinder2_spell
        create :pathfinder2_spell, user: user_session.user
      end

      context 'for 0.5.14 without homebrew' do
        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'pathfinder2', charkeeper_access_token: access_token, version: '0.5.14' }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
          expect(response_values.keys).to(
            contain_exactly(
              'id', 'slug', 'title', 'description', 'origin_value', 'origin_values', 'price', 'info', 'original_title',
              'focus_for', 'level'
            )
          )
        end
      end

      context 'for 0.5.14 with homebrew' do
        it 'returns data', :aggregate_failures do
          get :index, params: {
            provider: 'pathfinder2', charkeeper_access_token: access_token, version: '0.5.14', homebrew: 1
          }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
          expect(response_values.keys).to(
            contain_exactly(
              'id', 'slug', 'title', 'description', 'origin_value', 'origin_values', 'price', 'info', 'original_title',
              'focus_for', 'level'
            )
          )
        end
      end

      context 'for 0.5.15' do
        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'pathfinder2', charkeeper_access_token: access_token, version: '0.5.15' }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 2
          expect(response_values.keys).to(
            contain_exactly(
              'id', 'slug', 'title', 'description', 'origin_value', 'origin_values', 'price', 'info', 'original_title',
              'focus_for', 'level'
            )
          )
        end
      end
    end
  end
end
