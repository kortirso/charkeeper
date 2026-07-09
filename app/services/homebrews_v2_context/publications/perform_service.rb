# frozen_string_literal: true

module HomebrewsV2Context
  module Publications
    class PerformService
      def call(publication:) # rubocop: disable Metrics/AbcSize
        errors = {}
        JSON.parse(publication.file.download).each_with_index do |object, index|
          result = command_object(publication).call(object.symbolize_keys.merge({ user: publication.user }))
          errors[index.to_s] = result[:errors] if result[:errors]
        end
        publication.update!(errors_list: errors, completed_at: DateTime.now)
      rescue JSON::ParserError => _e
        publication.update!(errors_list: { '0' => { general: ['Invalid file'] } }, completed_at: DateTime.now)
      ensure
        publication.file.purge if publication.file.attached?
      end

      private

      def command_object(publication)
        @command_object ||=
          case publication.provider
          when 'dnd2024' then dnd2024_commands(publication)
          else daggerheart_commands(publication)
          end
      end

      def dnd2024_commands(publication)
        case publication.parent_type
        when 'feat' then HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new
        when 'background' then HomebrewsV2Context::Import::Dnd2024::Backgrounds::AddCommand.new
        when 'spell' then HomebrewsV2Context::Import::Dnd2024::Spells::AddCommand.new
        end
      end

      def daggerheart_commands(publication) # rubocop: disable Metrics/CyclomaticComplexity
        case publication.parent_type
        when 'character' then HomebrewsV2Context::Import::Daggerheart::Characters::AddCommand.new
        when 'transformation' then HomebrewsV2Context::Import::Daggerheart::Transformations::PerformCommand.new
        when 'ancestry' then HomebrewsV2Context::Import::Daggerheart::Ancestries::PerformCommand.new
        when 'community' then HomebrewsV2Context::Import::Daggerheart::Communities::PerformCommand.new
        when 'speciality' then HomebrewsV2Context::Import::Daggerheart::Specialities::PerformCommand.new
        when 'subclass' then HomebrewsV2Context::Import::Daggerheart::Subclasses::PerformCommand.new
        when 'domain' then HomebrewsV2Context::Import::Daggerheart::Domains::PerformCommand.new
        when 'mechanic' then HomebrewsV2Context::Import::Daggerheart::Mechanics::PerformCommand.new
        when 'armor' then HomebrewsV2Context::Import::Daggerheart::Items::Armors::AddCommand.new
        when 'consumables' then HomebrewsV2Context::Import::Daggerheart::Items::Consumables::AddCommand.new
        when 'item' then HomebrewsV2Context::Import::Daggerheart::Items::Items::AddCommand.new
        when 'weapon' then HomebrewsV2Context::Import::Daggerheart::Items::Weapons::AddCommand.new
        end
      end
    end
  end
end
