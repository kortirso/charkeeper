# frozen_string_literal: true

describe Frontend::Homebrews::SpecialitiesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for Daggerheart' do
        let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }
        let!(:speciality1) { create :homebrew_speciality, :daggerheart, user: user_session.user }

        before { create :homebrew_speciality, :daggerheart }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['specialities'].size).to eq 1
          expect(response.parsed_body['specialities'].pluck('id')).to contain_exactly(speciality1.id)
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: {
          brewery: { name: name, evasion: 10, health_max: 6, domains: %w[arcana codex] },
          provider: 'daggerheart',
          charkeeper_access_token: access_token
        }
      }

      context 'for invalid params' do
        let(:name) { '' }

        it 'does not create homebrew', :aggregate_failures do
          expect { request }.not_to change(Daggerheart::Homebrew::Speciality, :count)
          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid params' do
        let(:name) { 'Witch' }

        it 'creates homebrew', :aggregate_failures do
          expect { request }.to change(Daggerheart::Homebrew::Speciality, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:homebrew) { create :homebrew_speciality, :daggerheart }

      context 'for unexisting homebrew' do
        it 'returns error' do
          delete :destroy, params: { id: 'unexisting', provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user homebrew' do
        it 'returns error' do
          delete :destroy, params: { id: homebrew.id, provider: 'daggerheart', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          delete :destroy, params: { id: homebrew.id, provider: 'daggerheart', charkeeper_access_token: access_token }
        }

        before { homebrew.update!(user: user_session.user) }

        it 'deletes homebrew', :aggregate_failures do
          expect { request }.to change(Daggerheart::Homebrew::Speciality, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end

        context 'when character exists with deleting main class' do
          let!(:character) { create :character, :daggerheart, user: user_session.user }

          before do
            character.data['main_class'] = homebrew.id
            character.save
          end

          it 'returns error', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Homebrew::Speciality, :count)
            expect(response).to have_http_status :unprocessable_content
            expect(response.parsed_body['errors']).to eq({ 'base' => ['Персонаж с таким классом существует'] })
          end
        end
      end
    end
  end
end
