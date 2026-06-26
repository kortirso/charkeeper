# frozen_string_literal: true

module HomebrewsV2Context
  module Publications
    class PerformService
      def call(publication:) # rubocop: disable Metrics/AbcSize
        errors = {}
        JSON.parse(publication.file.download).each_with_index do |object, index|
          result = command_object(publication).call(object.symbolize_keys.merge({ user: publication.user }))
          errors[index.to_s] = result[:raw_errors] if result[:raw_errors]
        end
        publication.update!(errors_list: errors, completed_at: DateTime.now)
      rescue JSON::ParserError => _e
        publication.update!(errors_list: { '0' => { general: ['Invalid file'] } }, completed_at: DateTime.now)
      ensure
        publication.file.purge if publication.file.attached?
      end

      private

      def command_object(publication) # rubocop: disable Metrics/CyclomaticComplexity
        @command_object ||=
          case publication.parent_type
          when 'character' then HomebrewsV2Context::Import::Daggerheart::Characters::AddCommand.new
          when 'transformation' then HomebrewsV2Context::Import::Daggerheart::Transformations::AddCommand.new
          when 'ancestry' then HomebrewsV2Context::Import::Daggerheart::Ancestries::AddCommand.new
          when 'community' then HomebrewsV2Context::Import::Daggerheart::Communities::AddCommand.new
          when 'speciality' then HomebrewsV2Context::Import::Daggerheart::Specialities::AddCommand.new
          when 'subclass' then HomebrewsV2Context::Import::Daggerheart::Subclasses::AddCommand.new
          when 'domain' then HomebrewsV2Context::Import::Daggerheart::Domains::AddCommand.new
          when 'armor' then HomebrewsV2Context::Import::Daggerheart::Items::Armors::AddCommand.new
          when 'consumables' then HomebrewsV2Context::Import::Daggerheart::Items::Consumables::AddCommand.new
          when 'item' then HomebrewsV2Context::Import::Daggerheart::Items::Items::AddCommand.new
          when 'weapon' then HomebrewsV2Context::Import::Daggerheart::Items::Weapons::AddCommand.new
          end
      end
    end
  end
end
