# frozen_string_literal: true

describe HomebrewsV2::PublicationsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let!(:publication) do
        create :homebrew_publication, user: user_session.user, parent_type: 'Homebrews::Daggerheart::Transformation'
      end

      let(:request) do
        get :index, params: { type: 'Homebrews::Daggerheart::Transformation', charkeeper_access_token: access_token }
      end

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['publications'].size).to eq 1
        expect(response.parsed_body['publications'].pluck('id')).to contain_exactly(publication.id)
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let(:file_path) { Rails.root.join('spec/fixtures/transformations.json') }
      let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }
      let(:request) {
        post :create, params: {
          parent_type: 'Homebrews::Daggerheart::Transformation',
          file: file,
          charkeeper_access_token: access_token
        }
      }

      context 'for valid params' do
        it 'creates publication', :aggregate_failures do
          expect { request }.to change(user_session.user.homebrew_publications, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end
end
