# frozen_string_literal: true

describe Frontend::Dnd2024::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :dnd2024_spell
        create :dnd2024_spell, user: user_session.user
      end

      context 'for 0.5.14 without homebrew' do
        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'pathfinder2', charkeeper_access_token: access_token, version: '0.5.14' }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
        end
      end

      context 'for 0.5.14 with homebrew' do
        it 'returns data', :aggregate_failures do
          get :index, params: {
            provider: 'pathfinder2', charkeeper_access_token: access_token, version: '0.5.14', homebrew: 1
          }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
        end
      end

      context 'for 0.5.15' do
        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'pathfinder2', charkeeper_access_token: access_token, version: '0.5.15' }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 2
        end
      end
    end
  end
end
