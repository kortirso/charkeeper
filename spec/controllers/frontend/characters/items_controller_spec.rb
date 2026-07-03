# frozen_string_literal: true

describe Frontend::Characters::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character }
  let!(:user_character) { create :character, user: user_session.user }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          get :index, params: { character_id: character.id, provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        before do
          create :character_item, character: user_character
          create :character_item, character: character
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, provider: 'dnd5', charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('items', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['items'].size).to eq 1
          expect(response_values.keys).to(
            contain_exactly(
              'id', 'notes', 'name', 'kind', 'bonuses', 'custom', 'charges', 'charges_max',
              'data', 'state', 'has_description', 'item_id', 'states', 'info', 'modifiers', 'item_modifiers'
            )
          )
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: { character_id: character.id, provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting item' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, item_id: 'unexisting', provider: 'dnd5', charkeeper_access_token: access_token
            }
          }

          it 'does not create character item', :aggregate_failures do
            expect { request }.not_to change(Character::Item, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing item' do
          let!(:item) { create :item }
          let(:request) {
            post :create, params: {
              character_id: user_character.id,
              item_id: item.id,
              provider: 'dnd5',
              charkeeper_access_token: access_token
            }
          }

          it 'creates character item', :aggregate_failures do
            expect { request }.to change(user_character.items, :count).by(1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end

          context 'for existing character item' do
            let!(:character_item) {
              create :character_item,
                     character: user_character,
                     item: item,
                     states: Character::Item.default_states.merge(hands: 1)
            }

            it 'updates existing character item', :aggregate_failures do
              expect { request }.not_to change(Character::Item, :count)
              expect(character_item.reload.states).to eq({ 'hands' => 1, 'equipment' => 0, 'backpack' => 1, 'storage' => 0 })
              expect(response).to have_http_status :ok
              expect(response.parsed_body).to eq({ 'result' => 'ok' })
            end
          end
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          patch :update, params: {
            character_id: 'unexisting',
            id: 'unexisting',
            provider: 'dnd5',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        before { create :character_item, character: character }

        it 'returns error' do
          patch :update, params: {
            character_id: character.id,
            id: 'unexisting',
            provider: 'dnd5',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for existing item' do
          let!(:item) {
            create :character_item, character: user_character, states: Character::Item.default_states.merge(hands: 1)
          }
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: item.id,
              provider: 'dnd5',
              character_item: { states: { backpack: 1 } },
              charkeeper_access_token: access_token
            }
          }

          it 'updates character item', :aggregate_failures do
            request

            expect(item.reload.states).to eq({ 'hands' => 1, 'equipment' => 0, 'backpack' => 1, 'storage' => 0 })
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
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
            provider: 'dnd5',
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
            provider: 'dnd5',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting item' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              provider: 'dnd5',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete character item', :aggregate_failures do
            expect { request }.not_to change(Character::Item, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing item' do
          let!(:item) { create :character_item, character: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: item.id,
              provider: 'dnd5',
              charkeeper_access_token: access_token
            }
          }

          it 'deletes character item', :aggregate_failures do
            expect { request }.to change(user_character.items, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
