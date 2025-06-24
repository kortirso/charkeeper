# frozen_string_literal: true

describe Frontend::Characters::BonusesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :daggerheart }
  let!(:user_character) { create :character, :daggerheart, user: user_session.user }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting provider' do
        it 'returns error' do
          get :index, params: { character_id: user_character.id, provider: 'invalid', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for invalid provider' do
        it 'returns error' do
          get :index, params: { character_id: user_character.id, provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          get :index, params: { character_id: character.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        before do
          create :character_bonus, character: user_character
          create :character_bonus, character: character
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('bonuses', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['bonuses'].size).to eq 1
          expect(response_values.keys).to contain_exactly('id', 'value', 'comment')
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: { character_id: character.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for invalid bonus' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id,
              provider: 'daggerheart',
              bonus: { value: { health: 'abc' } },
              charkeeper_access_token: access_token
            }
          }

          it 'does not create character bonus', :aggregate_failures do
            expect { request }.not_to change(Character::Bonus, :count)
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        context 'for value bonus' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id,
              provider: 'daggerheart',
              bonus: { value: { health: 1 }, comment: 'Comment' },
              charkeeper_access_token: access_token
            }
          }

          it 'creates character bonus', :aggregate_failures do
            expect { request }.to change(user_character.bonuses, :count).by(1)
            expect(response).to have_http_status :ok
          end
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          delete :destroy, params: {
            character_id: 'unexisting',
            id: 'unexisting',
            provider: 'daggerheart',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          delete :destroy, params: {
            character_id: character.id,
            id: 'unexisting',
            provider: 'daggerheart',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting bonus' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              provider: 'daggerheart',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete character bonus', :aggregate_failures do
            expect { request }.not_to change(Character::Bonus, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing item' do
          let!(:bonus) { create :character_bonus, character: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: bonus.id,
              provider: 'daggerheart',
              charkeeper_access_token: access_token
            }
          }

          it 'deletes character item', :aggregate_failures do
            expect { request }.to change(user_character.bonuses, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
