# frozen_string_literal: true

describe 'Feedbacks' do
  describe 'GET#index' do
    context 'without feedbacks' do
      it 'renders index page' do
        get '/adminbook/feedbacks'

        expect(response).to have_http_status :ok
      end
    end

    context 'with feedbacks' do
      let!(:feedback1) { create :user_feedback }
      let!(:feedback2) { create :user_feedback }

      it 'renders index page', :aggregate_failures do
        get '/adminbook/feedbacks'

        expect(response).to have_http_status :ok
        expect(response.body).to include(feedback1.value)
        expect(response.body).to include(feedback2.value)
      end
    end
  end
end
