# frozen_string_literal: true

describe HomebrewContext::Daggerheart::AddItemCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:user) { create :user }
  let(:valid_params) do
    { user: user, name: 'Name', kind: 'consumables' }
  end

  context 'for invalid params' do
    context 'for invalid name' do
      let(:params) { valid_params.merge(name: '') }

      it 'does not create item', :aggregate_failures do
        expect { command_call }.not_to change(Item, :count)
        expect(command_call[:errors]).to eq({ name: ["Name can't be blank"] })
      end
    end

    context 'for long name' do
      let(:params) { valid_params.merge(name: 'a' * 51) }

      it 'does not create item', :aggregate_failures do
        expect { command_call }.not_to change(Item, :count)
        expect(command_call[:errors]).to eq({ name: ["Name's size cannot be greater than 50"] })
      end
    end
  end

  context 'for valid params' do
    let(:params) { valid_params }

    it 'creates item', :aggregate_failures do
      expect { command_call }.to change(user.items, :count).by(1)
      expect(command_call[:errors]).to be_nil
    end
  end
end
