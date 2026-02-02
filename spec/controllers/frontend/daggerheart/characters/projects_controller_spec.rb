# frozen_string_literal: true

describe Frontend::Daggerheart::Characters::ProjectsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :daggerheart }
  let!(:user_character) { create :character, :daggerheart, user: user_session.user, data: { main_class: 'bard' } }

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
          create :daggerheart_project, character: user_character
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['projects'].size).to eq 1
        end
      end
    end
  end

  describe 'POST#create' do
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
        let(:request) {
          post :create, params: { character_id: user_character.id, project: project, charkeeper_access_token: access_token }
        }

        context 'for invalid data' do
          let(:project) do
            {
              title: '',
              description: 'Clean water for Wasteland',
              complexity: 10
            }
          end

          it 'does not create project', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Character.find(user_character.id).projects, :count)
            expect(response).to have_http_status :unprocessable_content
          end
        end

        context 'for valid data' do
          let(:project) do
            {
              title: 'Clean water',
              description: 'Clean water for Wasteland',
              complexity: 10
            }
          end

          it 'creates project', :aggregate_failures do
            expect { request }.to change(Daggerheart::Character.find(user_character.id).projects, :count).by(1)
            expect(response).to have_http_status :created
          end
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          patch :update, params: { character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          patch :update, params: { character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:project) { { title: 'Projectio' } }

        context 'for unexisting project' do
          let(:request) {
            patch :update, params: {
              character_id: user_character.id, id: 'unexisting', project: project, charkeeper_access_token: access_token
            }
          }

          it 'does not update character project' do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing project' do
          let!(:daggerheart_project) { create :daggerheart_project, character: user_character }
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: daggerheart_project.id,
              project: project,
              charkeeper_access_token: access_token
            }
          }

          it 'updates project', :aggregate_failures do
            request

            expect(daggerheart_project.reload.title).to eq 'Projectio'
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
        context 'for unexisting project' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete character project', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Project, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing project' do
          let!(:daggerheart_project) { create :daggerheart_project, character: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: daggerheart_project.id,
              charkeeper_access_token: access_token
            }
          }

          it 'deletes character project', :aggregate_failures do
            expect { request }.to change(Daggerheart::Project, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
