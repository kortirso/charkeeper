# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Subclasses
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.dnd_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              subclass = ::Dnd2024::Homebrews::Subclass.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'subclass',
                    origin_value: subclass.id
                  })
                )
              end
              subclass
            end

            cache.push_item(key: :subclasses, item: result)

            { result: result }
          end

          def add_feat = HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new
        end
      end
    end
  end
end
