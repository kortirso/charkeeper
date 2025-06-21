# frozen_string_literal: true

describe User::Feedback do
  it 'factory should be valid' do
    user_feedback = build :user_feedback

    expect(user_feedback).to be_valid
  end
end
