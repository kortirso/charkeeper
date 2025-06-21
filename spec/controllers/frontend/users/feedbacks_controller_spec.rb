# frozen_string_literal: true

describe Frontend::Users::FeedbacksController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      context 'for invalid params' do
        let(:request) do
          post :create, params: { feedback: { value: '' }, charkeeper_access_token: access_token }
        end

        it 'does not create feedback', :aggregate_failures do
          expect { request }.not_to change(User::Feedback, :count)
          expect(response).to have_http_status :unprocessable_entity
        end
      end

      context 'for valid params' do
        let(:request) do
          post :create, params: { feedback: { value: 'feedback' }, charkeeper_access_token: access_token }
        end

        it 'creates feedback', :aggregate_failures do
          expect { request }.to change(user_session.user.feedbacks, :count).by(1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
