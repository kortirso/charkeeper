# frozen_string_literal: true

require 'open3'

describe 'Translations coverage' do # rubocop: disable RSpec/DescribeClass
  # Interface texts (i18n files and TRANSLATION constants of components) must be translated for these locales.
  translated_interfaces = %w[es]
  # Systems are added here once all their game data is translated to the locale.
  translated_game_data = {
    'es' => %w[cthulhu7]
  }
  apps_path = 'app/javascript/applications'

  # Values spelled the same in the locale, they are not missing translations.
  let(:same_values) do
    {
      'es' => [
        'Base', 'Cosmere', 'Daggerheart', 'Fallout 2D20', 'Fate', 'General', 'Homebrew', 'Material', 'Mental', 'min',
        'Nimble', 'Pathfinder 2', 'Personal', 'Ritual', 'Verbal'
      ]
    }
  end

  # Components keep translations in a JS object literal, node evaluates them to avoid parsing JS in ruby.
  def self.components_translations(files)
    literals = files.to_h { |file| [file.to_s, file.read[/^const TRANSLATION = (\{.*?^\})/m, 1]] }.compact
    script = <<~JS
      const literals = JSON.parse(require('fs').readFileSync(0, 'utf8'));
      const result = Object.fromEntries(Object.entries(literals).map(([file, literal]) => [file, Function('return ' + literal)()]));
      process.stdout.write(JSON.stringify(result));
    JS
    output, status = Open3.capture2('node', '-e', script, stdin_data: literals.to_json)
    raise 'Can not evaluate TRANSLATION constants' unless status.success?

    JSON.parse(output)
  end

  def i18n_file(locale)
    JSON.parse(Rails.root.join("app/javascript/applications/CharKeeperApp/i18n/#{locale}.json").read)
  end

  def untranslated(value, locale, path=[])
    case value
    when Hash
      own = value['en'].is_a?(String) && missing_value?(value['en'], value[locale], locale) ? [path.join(' > ')] : []
      own + value.flat_map { |key, item| untranslated(item, locale, path + [key]) }
    when Array
      value.each_with_index.flat_map { |item, index| untranslated(item, locale, path + [index]) }
    else
      []
    end
  end

  def untranslated_keys(original, translation, locale, path=[])
    original.flat_map do |key, value|
      next untranslated_keys(value, translation&.dig(key) || {}, locale, path + [key]) if value.is_a?(Hash)

      missing_value?(value, translation&.dig(key), locale) ? [(path + [key]).join(' > ')] : []
    end
  end

  def missing_value?(original, translation, locale)
    return false if !original.is_a?(String) || original.blank?
    return true if translation.blank?

    translation == original && original.match?(/[a-z]{3}/i) && same_values.fetch(locale, []).exclude?(original)
  end

  translated_interfaces.each do |locale|
    it "translates i18n file to #{locale}" do
      missing = untranslated_keys(i18n_file('en'), i18n_file(locale), locale)

      expect(missing).to be_empty, "Missing #{locale} translations:\n#{missing.join("\n")}"
    end

    components_translations(Rails.root.glob("#{apps_path}/**/*.jsx")).each do |file, translations|
      it "translates component #{Pathname(file).relative_path_from(Rails.root)} to #{locale}" do
        missing = untranslated_keys(translations['en'], translations[locale], locale)

        expect(missing).to be_empty, "Missing #{locale} translations:\n#{missing.join("\n")}"
      end
    end
  end

  translated_game_data.each do |locale, providers|
    providers.each do |provider|
      data_files = Rails.root.glob("config/settings/#{provider}/*.json")
      data_files << Rails.root.join("#{apps_path}/CharKeeperApp/data/#{provider}.json")

      data_files.select(&:exist?).each do |file|
        it "translates game data #{file.relative_path_from(Rails.root)} to #{locale}" do
          missing = untranslated(JSON.parse(file.read), locale).map { |path| "#{file.basename} > #{path}" }

          expect(missing).to be_empty, "Missing #{locale} translations:\n#{missing.join("\n")}"
        end
      end
    end
  end
end
