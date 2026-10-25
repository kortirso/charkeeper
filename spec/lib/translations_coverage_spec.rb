# frozen_string_literal: true

# Systems are added here once all their game data is translated to the locale,
# so new keys without translation are caught for them.
describe 'Translations coverage' do # rubocop: disable RSpec/DescribeClass
  fully_translated = {
    'es' => %w[cthulhu7]
  }

  def missing_translations(value, locale, path=[])
    case value
    when Hash
      own = value['en'].is_a?(String) && value[locale].blank? ? [path.join(' > ')] : []
      own + value.flat_map { |key, item| missing_translations(item, locale, path + [key]) }
    when Array
      value.each_with_index.flat_map { |item, index| missing_translations(item, locale, path + [index]) }
    else
      []
    end
  end

  fully_translated.each do |locale, providers|
    providers.each do |provider|
      files = Rails.root.glob("config/settings/#{provider}/*.json")
      files << Rails.root.join("app/javascript/applications/CharKeeperApp/data/#{provider}.json")

      files.select(&:exist?).each do |file|
        it "translates #{file.relative_path_from(Rails.root)} to #{locale}" do
          missing = missing_translations(JSON.parse(file.read), locale).map { |path| "#{file.basename} > #{path}" }

          expect(missing).to be_empty, "Missing #{locale} translations:\n#{missing.join("\n")}"
        end
      end
    end
  end
end
