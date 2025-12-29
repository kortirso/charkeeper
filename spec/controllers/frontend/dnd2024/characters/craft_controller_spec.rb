# frozen_string_literal: true

describe Frontend::Dnd2024::Characters::CraftController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :dnd2024 }
  let!(:user_character) { create :character, :dnd2024, user: user_session.user, data: { main_class: 'bard' } }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          get :index, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        before do
          tool = create :item, slug: 'herbalism', kind: 'tools', data: { weight: 3, price: 500 }
          item = create :item, slug: 'potion_healing', kind: 'potion', data: { weight: 0.5, price: 5_000 }

          create :item_recipe, tool: tool, item: item, info: { output_per_day: 1 }
          create :character_item, character: user_character, item: tool

          user_character.data = user_character.data.merge(tools: ['herbalism'])
          user_character.save
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['tools'].size).to eq 1
        end
      end
    end
  end

  describe 'POST#create' do
    let!(:item) { create :item, slug: 'potion_healing', kind: 'potion', data: { weight: 0.5, price: 5_000 } }

    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        before do
          user_character.data = user_character.data.merge(money: 5_000)
          user_character.save
        end

        context 'when money is enough' do
          let(:request) do
            post :create, params: {
              character_id: user_character.id, charkeeper_access_token: access_token, price: 2_500, amount: 2, item_id: item.id
            }
          end

          context 'when character does not have such items' do
            it 'add items', :aggregate_failures do
              expect { request }.to change(user_character.items, :count).by(1)
              expect(user_character.reload.data.money).to eq 2_500
              expect(response).to have_http_status :ok
            end
          end

          context 'when character has such items' do
            let!(:character_item) do
              create :character_item, character: user_character, item: item, states: {
                hands: 1, equipment: 0, backpack: 1, storage: 0
              }
            end

            it 'add items', :aggregate_failures do
              expect { request }.not_to change(user_character.items, :count)
              expect(character_item.reload.states['backpack']).to eq 3
              expect(user_character.reload.data.money).to eq 2_500
              expect(response).to have_http_status :ok
            end
          end
        end

        context 'when money is not enough' do
          let(:request) do
            post :create, params: {
              character_id: user_character.id, charkeeper_access_token: access_token, price: 5_100, amount: 2, item_id: item.id
            }
          end

          it 'does not add items', :aggregate_failures do
            expect { request }.not_to change(user_character.items, :count)
            expect(user_character.reload.data.money).to eq 5_000
            expect(response).to have_http_status :unprocessable_content
          end
        end
      end
    end
  end
end
