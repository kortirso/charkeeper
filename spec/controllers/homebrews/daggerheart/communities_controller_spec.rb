# frozen_string_literal: true

describe Homebrews::Daggerheart::CommunitiesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:homebrew) { create :homebrew_community, :daggerheart }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }

      before { homebrew.update!(user: user_session.user) }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['communities'].size).to eq 1
        expect(response.parsed_body['communities'].pluck('id')).to contain_exactly(homebrew.id)
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      let(:request) { get :show, params: { id: homebrew.id, provider: 'daggerheart', charkeeper_access_token: access_token } }

      context 'for not user community' do
        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user community' do
        before { homebrew.update!(user: user_session.user) }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['community']['id']).to eq homebrew.id
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: { brewery: { name: name }, provider: 'daggerheart', charkeeper_access_token: access_token }
      }

      context 'for invalid params' do
        let(:name) { '' }

        it 'does not create homebrew', :aggregate_failures do
          expect { request }.not_to change(Daggerheart::Homebrew::Community, :count)
          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid params' do
        let(:name) { 'Gangsters' }

        it 'creates homebrew', :aggregate_failures do
          expect { request }.to change(Daggerheart::Homebrew::Community, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      let(:request) {
        patch :update, params: {
          id: homebrew.id, brewery: { name: name }, provider: 'daggerheart', charkeeper_access_token: access_token
        }
      }

      before { homebrew.update!(user: user_session.user) }

      context 'for invalid params' do
        let(:name) { '' }

        it 'does not update homebrew', :aggregate_failures do
          request

          expect(response).to have_http_status :unprocessable_content
          expect(homebrew.name['en']).not_to eq ''
        end
      end

      context 'for valid params' do
        let(:name) { 'Gangsters' }

        it 'updates homebrew', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(homebrew.name['en']).not_to eq 'Gangsters'
        end
      end
    end
  end

  describe 'POST#copy' do
    context 'for logged users' do
      let(:request) {
        post :copy, params: { id: homebrew.id, provider: 'daggerheart', charkeeper_access_token: access_token }
      }

      context 'for valid params' do
        it 'copies homebrew', :aggregate_failures do
          expect { request }.to change(Daggerheart::Homebrew::Community, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
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
          expect { request }.to change(Daggerheart::Homebrew::Community, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end

        context 'when character exists with deleting ancestry' do
          let!(:character) { create :character, :daggerheart, user: user_session.user }

          before do
            character.data['community'] = homebrew.id
            character.save
          end

          it 'discards homebrew', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Homebrew::Community, :count)
            expect(response).to have_http_status :ok
            expect(homebrew.reload.discarded?).to be_truthy
          end
        end
      end
    end
  end
end
