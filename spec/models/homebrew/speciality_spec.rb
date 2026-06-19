# frozen_string_literal: true

describe Homebrew::Speciality do
  it 'factory should be valid' do
    homebrew_speciality = build :homebrew_speciality, :cosmere

    expect(homebrew_speciality).to be_valid
  end
end
