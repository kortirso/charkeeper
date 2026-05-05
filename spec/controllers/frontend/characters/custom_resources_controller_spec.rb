# frozen_string_literal: true

describe Frontend::Characters::CustomResourcesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:character) { create :character }
  let!(:user_character) { create :character, user: user_session.user }

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
          create :custom_resource, resourceable: user_character
          create :custom_resource, resourceable: character
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('custom_resources', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['custom_resources'].size).to eq 1
          expect(response_values.keys).to contain_exactly(
            'id', 'name', 'description', 'max_value', 'resets', 'reset_direction'
          )
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: {
            character_id: 'unexisting', resource: { name: 'title' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: {
            character_id: character.id, resource: { name: 'title' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for invalid params' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, resource: { name: '' }, charkeeper_access_token: access_token
            }
          }

          it 'does not create character resource', :aggregate_failures do
            expect { request }.not_to change(user_character.custom_resources, :count)
            expect(response).to have_http_status :unprocessable_content
          end
        end

        context 'for valid params' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, resource: { name: 'title' }, charkeeper_access_token: access_token
            }
          }

          it 'creates character resource', :aggregate_failures do
            expect { request }.to change(user_character.custom_resources, :count).by(1)
            expect(response).to have_http_status :created
            expect(response.parsed_body['custom_resource'].keys).to contain_exactly(
              'id', 'name', 'description', 'max_value', 'resets', 'reset_direction'
            )
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
            character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token, resource: { name: '' }
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          patch :update, params: {
            character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token, resource: { name: '' }
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting resource' do
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: 'unexisting',
              resource: { name: '' },
              charkeeper_access_token: access_token
            }
          }

          it 'does not update character resource', :aggregate_failures do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing resource' do
          let!(:resource) { create :custom_resource, resourceable: user_character }

          context 'for invalid params' do
            let(:request) {
              patch :update, params: {
                character_id: user_character.id,
                id: resource.id,
                resource: { name: '' },
                charkeeper_access_token: access_token
              }
            }

            it 'updates character resource', :aggregate_failures do
              request

              expect(resource.reload.name).not_to eq 'Name'
              expect(response).to have_http_status :unprocessable_content
            end
          end

          context 'for valid params' do
            let(:request) {
              patch :update, params: {
                character_id: user_character.id,
                id: resource.id,
                resource: { name: 'Name' },
                charkeeper_access_token: access_token
              }
            }

            it 'updates character resource', :aggregate_failures do
              request

              expect(resource.reload.name).to eq 'Name'
              expect(response).to have_http_status :ok
              expect(response.parsed_body).to eq({ 'result' => 'ok' })
            end
          end
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          delete :destroy, params: { character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          delete :destroy, params: { character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting resource' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete character resource', :aggregate_failures do
            expect { request }.not_to change(CustomResource, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing resource' do
          let!(:resource) { create :custom_resource, resourceable: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: resource.id,
              charkeeper_access_token: access_token
            }
          }

          it 'deletes character resource', :aggregate_failures do
            expect { request }.to change(user_character.custom_resources, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
