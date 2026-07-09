# frozen_string_literal: true

describe HomebrewsV2::Daggerheart::MechanicsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:own_element) { create :homebrew, :daggerheart_mechanic, user: user_session.user }
  let!(:element) { create :homebrew, :daggerheart_mechanic }

  before do
    create :homebrew, :daggerheart_mechanic_item, homebrew: own_element
    create :homebrew, :daggerheart_mechanic_item, homebrew: element
  end

  describe 'GET#show' do
    context 'for logged users' do
      context 'for unexisting homebrew' do
        let(:request) { get :show, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing homebrew' do
        let(:request) { get :show, params: { id: element.id, charkeeper_access_token: access_token } }

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['homebrew'].keys).to contain_exactly('id', 'items')
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting homebrew' do
        let(:request) { delete :destroy, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for unavailable homebrew' do
        let(:request) { delete :destroy, params: { id: element.id, charkeeper_access_token: access_token } }

        it 'returns error' do
          request

          expect(response).to have_http_status :not_found
        end
      end

      context 'for available homebrew' do
        let(:request) { delete :destroy, params: { id: own_element.id, charkeeper_access_token: access_token } }

        it 'discards homebrew', :aggregate_failures do
          expect { request }.to change(Homebrew.kept, :count).by(-1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end

  # describe 'POST#copy' do
  #   context 'for logged users' do
  #     context 'for unexisting homebrew' do
  #       let(:request) { post :copy, params: { id: 'unexisting', charkeeper_access_token: access_token } }

  #       it 'returns error' do
  #         request

  #         expect(response).to have_http_status :not_found
  #       end
  #     end

  #     context 'for existing own homebrew' do
  #       let(:request) { post :copy, params: { id: own_element.id, charkeeper_access_token: access_token } }

  #       it 'returns error', :aggregate_failures do
  #         expect { request }.not_to change(Daggerheart::Homebrews::Mechanic, :count)
  #         expect(response).to have_http_status :not_found
  #       end
  #     end

  #     context 'for existing homebrew' do
  #       let(:request) { post :copy, params: { id: element.id, charkeeper_access_token: access_token } }

  #       it 'creates homebrew', :aggregate_failures do
  #         expect { request }.to change(Daggerheart::Homebrews::Mechanic, :count).by(1)
  #         expect(response).to have_http_status :created
  #       end
  #     end
  #   end
  # end
end
