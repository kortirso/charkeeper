# frozen_string_literal: true

describe Frontend::Campaigns::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:campaign) { create :campaign, user: user_session.user, provider: 'dnd5' }
  let!(:character) { create :character }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting campaign' do
        it 'returns error' do
          get :index, params: { campaign_id: 'unexisting', provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for campaign' do
        before do
          create :campaign_item, campaign: campaign
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { campaign_id: campaign.id, provider: 'dnd5', charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('items', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['items'].size).to eq 1
          expect(response_values.keys).to(
            contain_exactly(
              'id', 'notes', 'name', 'kind', 'bonuses', 'custom',
              'data', 'has_description', 'item_id', 'states', 'info', 'modifiers', 'item_modifiers'
            )
          )
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting campaign' do
        it 'returns error' do
          post :create, params: { campaign_id: 'unexisting', provider: 'dnd5', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for campaign' do
        context 'for unexisting item' do
          let(:request) {
            post :create, params: {
              campaign_id: campaign.id, item_id: 'unexisting', provider: 'dnd5', charkeeper_access_token: access_token
            }
          }

          it 'does not create campaign item', :aggregate_failures do
            expect { request }.not_to change(Campaign::Item, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing item' do
          let!(:item) { create :item }
          let(:request) {
            post :create, params: {
              campaign_id: campaign.id,
              item_id: item.id,
              provider: 'dnd5',
              charkeeper_access_token: access_token
            }
          }

          it 'creates campaign item', :aggregate_failures do
            expect { request }.to change(campaign.items, :count).by(1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end

          context 'for existing campaign item' do
            let!(:campaign_item) do
              create :campaign_item,
                     campaign: campaign,
                     item: item,
                     states: Campaign::Item.default_states.merge({ 'shared' => 1 })
            end

            it 'updates existing campaign item', :aggregate_failures do
              expect { request }.not_to change(Campaign::Item, :count)
              expect(campaign_item.reload.states).to eq(Campaign::Item.default_states.merge({ 'shared' => 2 }))
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
      context 'for unexisting campaign' do
        it 'returns error' do
          patch :update, params: {
            campaign_id: 'unexisting',
            id: 'unexisting',
            provider: 'dnd5',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for campaign' do
        before { create :campaign_item, campaign: campaign }

        context 'for unexisting item' do
          let(:request) {
            patch :update, params: {
              campaign_id: campaign.id,
              id: 'unexisting',
              provider: 'dnd5',
              character_item: { states: { 'shared' => 2 } },
              charkeeper_access_token: access_token
            }
          }

          it 'does not update campaign item' do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing item' do
          let!(:item) { create :campaign_item, campaign: campaign }
          let(:request) {
            patch :update, params: {
              campaign_id: campaign.id,
              id: item.id,
              provider: 'dnd5',
              character_item: { states: { 'shared' => 2 } },
              charkeeper_access_token: access_token
            }
          }

          it 'updates character item', :aggregate_failures do
            request

            expect(item.reload.states['shared']).to eq 2
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
            campaign_id: 'unexisting',
            id: 'unexisting',
            provider: 'dnd5',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for campaign' do
        context 'for unexisting item' do
          let(:request) {
            delete :destroy, params: {
              campaign_id: campaign.id,
              id: 'unexisting',
              provider: 'dnd5',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete campaign item', :aggregate_failures do
            expect { request }.not_to change(Character::Item, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing item' do
          let!(:item) { create :campaign_item, campaign: campaign }
          let(:request) {
            delete :destroy, params: {
              campaign_id: campaign.id,
              id: item.id,
              provider: 'dnd5',
              charkeeper_access_token: access_token
            }
          }

          it 'deletes campaign item', :aggregate_failures do
            expect { request }.to change(campaign.items, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end

  describe 'POST#send_item' do
    context 'for logged users' do
      context 'for campaign' do
        context 'for existing item' do
          let!(:item) { create :item }
          let!(:campaign_item) { create :campaign_item, campaign: campaign, item: item, states: { 'shared' => 2 } }
          let(:request) {
            post :send_item, params: {
              campaign_id: campaign.id,
              id: campaign_item.id,
              provider: 'dnd5',
              character_item: { for_campaign: true, state: 'shared', amount: 1, character_id: character.id },
              charkeeper_access_token: access_token
            }
          }

          it 'creates character item', :aggregate_failures do
            expect { request }.to change(character.items, :count).by(1)
            expect(campaign_item.reload.states['shared']).to eq 1
            expect(Character::Item.last.states['backpack']).to eq 1
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end

          context 'for existing character item' do
            let!(:character_item) do
              create :character_item,
                     character: character,
                     item: item,
                     states: Character::Item.default_states.merge({ 'backpack' => 1 })
            end

            it 'updates existing character item', :aggregate_failures do
              expect { request }.not_to change(Character::Item, :count)
              expect(character_item.reload.states['backpack']).to eq 2
              expect(response).to have_http_status :ok
              expect(response.parsed_body).to eq({ 'result' => 'ok' })
            end
          end
        end
      end

      context 'for character' do
        context 'for existing item' do
          let!(:item) { create :item }
          let!(:character_item) { create :character_item, character: character, item: item, states: { 'hands' => 2 } }
          let(:request) {
            post :send_item, params: {
              campaign_id: campaign.id,
              id: character_item.id,
              provider: 'dnd5',
              character_item: { for_campaign: false, state: 'hands', amount: 1, character_id: character.id },
              charkeeper_access_token: access_token
            }
          }

          it 'creates campaign item', :aggregate_failures do
            expect { request }.to change(campaign.items, :count).by(1)
            expect(character_item.reload.states['hands']).to eq 1
            expect(Campaign::Item.last.states['shared']).to eq 1
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end

          context 'for existing campaign item' do
            let!(:campaign_item) do
              create :campaign_item,
                     campaign: campaign,
                     item: item,
                     states: Campaign::Item.default_states.merge({ 'shared' => 1 })
            end

            it 'updates existing campaign item', :aggregate_failures do
              expect { request }.not_to change(Campaign::Item, :count)
              expect(campaign_item.reload.states['shared']).to eq 2
              expect(response).to have_http_status :ok
              expect(response.parsed_body).to eq({ 'result' => 'ok' })
            end
          end
        end
      end
    end
  end
end
