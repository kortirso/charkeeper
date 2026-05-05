# frozen_string_literal: true

describe CustomResource do
  it 'factory should be valid' do
    custom_resource = build :custom_resource

    expect(custom_resource).to be_valid
  end
end
