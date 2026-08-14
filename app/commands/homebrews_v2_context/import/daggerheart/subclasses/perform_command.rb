# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Subclasses
        class PerformCommand < BaseCommand
          use_contract do
            Spellcasts = Dry::Types['strict.string'].enum('agi', 'str', 'fin', 'ins', 'pre', 'know')

            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              required(:class_id).filled(:string)
              optional(:spellcast).maybe(Spellcasts)
              optional(:mechanics).maybe(:array, max_size?: 1).each(:string)
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:subclass] = ::Daggerheart::Homebrews::Subclass.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:subclass]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin] = 'subclass'
              feature[:origin_value] = 'subclass.id'

              validate_result = add_feat_command.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:class_id] = sanitize(input[:class_id])
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:class_id, :spellcast, :mechanics)
          end

          def do_persist(input)
            command =
              if input[:subclass]
                HomebrewsV2Context::Import::Daggerheart::Subclasses::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Daggerheart::Subclasses::AddCommand.new
              end
            command.call(input)
          end

          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.daggerheart.feats.add')
        end
      end
    end
  end
end
