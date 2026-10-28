# frozen_string_literal: true

require 'open3'

# Systems are added here once all their game data and character pages are translated to the locale,
# so new keys without translation are caught for them.
describe 'Translations coverage' do # rubocop: disable RSpec/DescribeClass
  fully_translated = {
    'es' => %w[cthulhu7]
  }
  app_path = 'app/javascript/applications/CharKeeperApp'

  # Pages keep translations in a JS object literal, node evaluates it to avoid parsing JS in ruby.
  def page_translations(file)
    literal = file.read[/^const TRANSLATION = (\{.*?^\})/m, 1]
    return {} if literal.nil?

    script = "process.stdout.write(JSON.stringify(Function('return ' + require('fs').readFileSync(0, 'utf8'))()))"
    output, status = Open3.capture2('node', '-e', script, stdin_data: literal)
    raise "Can not evaluate TRANSLATION in #{file}" unless status.success?

    JSON.parse(output)
  end

  def untranslated(value, locale, path=[])
    case value
    when Hash
      own = value['en'].is_a?(String) && missing_value?(value['en'], value[locale]) ? [path.join(' > ')] : []
      own + value.flat_map { |key, item| untranslated(item, locale, path + [key]) }
    when Array
      value.each_with_index.flat_map { |item, index| untranslated(item, locale, path + [index]) }
    else
      []
    end
  end

  def untranslated_page_keys(translations, locale, path=[])
    translations['en'].flat_map do |key, value|
      if value.is_a?(Hash)
        next untranslated_page_keys({ 'en' => value, locale => translations.dig(locale, key) || {} }, locale, path + [key])
      end

      missing_value?(value, translations.dig(locale, key)) ? [(path + [key]).join(' > ')] : []
    end
  end

  def missing_value?(original, translation)
    translation.blank? || (translation == original && original.match?(/[a-z]{3}/i))
  end

  fully_translated.each do |locale, providers|
    providers.each do |provider|
      data_files = Rails.root.glob("config/settings/#{provider}/*.json")
      data_files << Rails.root.join("#{app_path}/data/#{provider}.json")

      data_files.select(&:exist?).each do |file|
        it "translates game data #{file.relative_path_from(Rails.root)} to #{locale}" do
          missing = untranslated(JSON.parse(file.read), locale).map { |path| "#{file.basename} > #{path}" }

          expect(missing).to be_empty, "Missing #{locale} translations:\n#{missing.join("\n")}"
        end
      end

      page_files = Rails.root.glob("#{app_path}/pages/Content/Character/#{provider.camelize}/**/*.jsx")
      page_files += Rails.root.glob("#{app_path}/pages/{Content/Character,Navigation/Characters/Forms}/#{provider.camelize}.jsx")

      page_files.each do |file|
        it "translates page #{file.relative_path_from(Rails.root)} to #{locale}" do
          translations = page_translations(file)
          missing = translations.empty? ? [] : untranslated_page_keys(translations, locale)

          expect(missing).to be_empty, "Missing #{locale} translations:\n#{missing.join("\n")}"
        end
      end
    end
  end
end
