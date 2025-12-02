# frozen_string_literal: true

describe ActiveMarkdown do
  subject(:service_call) { described_class.new.call(value: value, version: version, initial_version: initial_version) }

  let(:value) { nil }
  let(:version) { nil }
  let(:initial_version) { nil }

  it 'returns value' do
    expect(service_call).to be_nil
  end

  context 'when markdown is present' do
    let(:value) { '**Bold**' }

    it 'returns demarked value' do
      expect(service_call).to eq "Bold\n"
    end

    context 'when new version is present' do
      let(:version) { '0.3.16' }

      it 'returns html text' do
        expect(service_call).to eq "<p><strong>Bold</strong></p>\n"
      end
    end
  end
end
